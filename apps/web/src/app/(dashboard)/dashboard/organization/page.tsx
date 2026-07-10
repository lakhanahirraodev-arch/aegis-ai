import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Team Members & Roles</h2>
        <p className="text-slate-400 text-sm">
          Manage workspace members, invitations, and role assignments.
        </p>
      </div>

      <div className="flex justify-center bg-slate-900 border border-slate-800 rounded-xl p-6">
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              cardBox: "bg-slate-900 shadow-none border-none text-slate-100",
              navbar: "bg-slate-950/20 border-r border-slate-800/50",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
            },
          }}
        />
      </div>
    </div>
  );
}
