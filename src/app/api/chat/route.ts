import { notesIndex } from "@/lib/db/pinecone";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((messages) => messages.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantNotes = await prisma?.note.findMany({
      where: {
        id: { in: vectorQueryResponse.matches.map((match) => match.id) },
      },
    });

    console.log(relevantNotes);

    const systemMessage: ChatCompletionMessage = {
      role: "system",
      content:
        "You are an intelligent note taking app. You answers to user question based on their existing notes. " +
        "The relevant notes for this query are:\n " +
        relevantNotes
          ?.map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Intenal Server Error" },
      { status: 500 },
    );
  }
}
