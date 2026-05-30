import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getUserProjects } from "@/lib/project-access";
import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorHomeContent } from "@/components/editor/editor-home-content";

export default async function EditorPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const projects = await getUserProjects();

  return (
    <EditorLayout projects={projects}>
      <EditorHomeContent />
    </EditorLayout>
  );
}