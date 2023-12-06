import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import React from "react";
import prisma from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Flowbrain - Notes",
};

const NotesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    throw Error("userId undefined");
  }

  const allNotes = await prisma?.note.findMany({ where: { userId } });

  return <div>{JSON.stringify(allNotes)}</div>;
};

export default NotesPage;
