import Icon from "@/components/Icon";

export default function IdeasPage() {
  return (
    <div className="flex items-center justify-center h-full px-8 py-8">
      <div className="text-center space-y-3">
        <Icon name="lightbulb" className="mx-auto h-10 w-10" />
        <p className="font-semibold text-lg">Идеи</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Раздел в разработке</p>
      </div>
    </div>
  );
}
