import Sidebar from "@/components/Sidebar";
import CreateWorldForm from "@/components/CreateWorldForm";

export default function NewWorldPage() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar mode="root" />
      <main className="flex-1 overflow-y-auto px-8 py-8 max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Новый мир</h1>
        <CreateWorldForm />
      </main>
    </div>
  );
}
