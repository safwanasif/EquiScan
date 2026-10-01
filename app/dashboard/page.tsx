import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import SignOutButton from "@/components/SignOutButton";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  role: string;
};

type DocumentRow = {
  id: string;
  title: string;
  source_type: string;
  char_count: number;
  created_at: string;
};

type ScanRow = {
  id: string;
  document_id: string;
  letter_grade: string;
  bias_score: number;
  total_flags: number;
  created_at: string;
};

type FlagRow = {
  status: string;
};

const scoreToGrade = (score: number | null): string => {
  if (score === null) return "--";
  if (score <= 2) return "A";
  if (score <= 4) return "B";
  if (score <= 6) return "C";
  if (score <= 8) return "D";
  return "F";
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("role, workspace_id, workspaces ( id, name, slug, created_at )")
    .eq("user_id", user.id);

  const workspaces: Workspace[] =
    memberships?.map((membership) => {
      const workspaceValue = membership.workspaces;
      const workspace = Array.isArray(workspaceValue)
        ? workspaceValue[0]
        : workspaceValue;

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        created_at: workspace.created_at,
        role: membership.role,
      };
    }) || [];

  const primaryWorkspace = workspaces[0];

  if (!primaryWorkspace) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-8">
            <h1 className="font-serif text-5xl tracking-tight mb-4">
              No workspace found.
            </h1>
            <p className="text-muted">
              Sign out and sign back in, or create a workspace in Supabase.
            </p>
          </section>
        </main>
      </>
    );
  }

  const { data: documentsData } = await supabase
    .from("documents")
    .select("id, title, source_type, char_count, created_at")
    .eq("workspace_id", primaryWorkspace.id)
    .order("created_at", { ascending: false });

  const { data: scansData } = await supabase
    .from("scans")
    .select("id, document_id, letter_grade, bias_score, total_flags, created_at")
    .eq("workspace_id", primaryWorkspace.id)
    .order("created_at", { ascending: false });

  const { data: flagsData } = await supabase
    .from("flags")
    .select("status")
    .eq("workspace_id", primaryWorkspace.id);

  const documents = (documentsData || []) as DocumentRow[];
  const scans = (scansData || []) as ScanRow[];
  const flags = (flagsData || []) as FlagRow[];

  const latestScanByDocument = new Map<string, ScanRow>();

  for (const scan of scans) {
    if (!latestScanByDocument.has(scan.document_id)) {
      latestScanByDocument.set(scan.document_id, scan);
    }
  }

  const documentsWithScans = documents.map((document) => ({
    ...document,
    scan: latestScanByDocument.get(document.id) || null,
  }));

  const documentCount = documents.length;
  const totalFlags = flags.length;
  const resolvedFlags = flags.filter(
    (flag) => flag.status === "accepted" || flag.status === "resolved"
  ).length;

  const averageBiasScore =
    scans.length > 0
      ? scans.reduce((sum, scan) => sum + Number(scan.bias_score), 0) /
        scans.length
      : null;

  const curriculumGrade = scoreToGrade(averageBiasScore);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-8">
          <div className="flex items-start justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                <span className="section-label">Workspace</span>
              </div>
              <h1 className="font-serif text-5xl lg:text-6xl tracking-tight leading-tight mb-3">
                {primaryWorkspace.name}
              </h1>
              <p className="text-muted text-lg">Signed in as {user.email}</p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-line rounded-sm p-6">
              <p className="section-label mb-3">Documents</p>
              <p className="font-serif text-5xl leading-none">
                {documentCount}
              </p>
              <p className="text-xs text-muted mt-2">
                {documentCount === 1 ? "1 audited document" : "Audited materials"}
              </p>
            </div>

            <div className="bg-white border border-line rounded-sm p-6">
              <p className="section-label mb-3">Workspace Grade</p>
              <p className="font-serif text-5xl leading-none text-rose">
                {curriculumGrade}
              </p>
              <p className="text-xs text-muted mt-2">
                {averageBiasScore === null
                  ? "Awaiting first scan"
                  : `Average bias score ${averageBiasScore.toFixed(1)}/10`}
              </p>
            </div>

            <div className="bg-white border border-line rounded-sm p-6">
              <p className="section-label mb-3">Open Flags</p>
              <p className="font-serif text-5xl leading-none">
                {totalFlags - resolvedFlags}
              </p>
              <p className="text-xs text-muted mt-2">
                {totalFlags} total flags detected
              </p>
            </div>
          </div>

          <div className="border-t border-line pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="section-label mb-2">Documents</p>
                <h2 className="font-serif text-3xl tracking-tight">
                  Your audited materials
                </h2>
              </div>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-sm hover:bg-rose transition-colors rounded-sm"
              >
                <span>New audit</span>
              </Link>
            </div>

            {documentsWithScans.length > 0 ? (
              <div className="space-y-4">
                {documentsWithScans.map((document) => (
                  <div
                    key={document.id}
                    className="bg-white border border-line rounded-sm p-6 grid md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-6">
                      <p className="font-mono text-[10px] tracking-widest text-rose uppercase mb-2">
                        {document.source_type} • {formatDate(document.created_at)}
                      </p>
                      <h3 className="font-serif text-2xl tracking-tight mb-2">
                        {document.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {document.char_count.toLocaleString()} characters audited
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="section-label mb-2">Grade</p>
                      <p className="font-serif text-4xl text-rose leading-none">
                        {document.scan?.letter_grade || "--"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="section-label mb-2">Flags</p>
                      <p className="font-serif text-4xl leading-none">
                        {document.scan?.total_flags ?? 0}
                      </p>
                    </div>

                    <div className="md:col-span-2 text-left md:text-right">
                      <p className="text-xs text-muted">
                        {document.scan
                          ? `Score ${document.scan.bias_score}/10`
                          : "No scan found"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-paperShade/40 border border-line border-dashed rounded-sm p-12 text-center">
                <p className="font-serif text-2xl text-muted italic mb-4">
                  No documents audited yet.
                </p>
                <p className="text-sm text-muted mb-6">
                  Run your first audit to start building your curriculum bias
                  report.
                </p>
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2 text-rose border-b border-rose pb-0.5 hover:text-rose-dim transition-colors"
                >
                  <span>Audit a document</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}