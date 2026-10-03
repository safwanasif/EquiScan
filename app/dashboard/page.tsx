import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import SignOutButton from "@/components/SignOutButton";
import AuditTrashButton from "@/components/AuditTrashButton";

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
  deleted_at: string | null;
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
  document_id: string;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const query = (await searchParams).q;
  const search = typeof query === "string" ? query.trim().slice(0, 240) : "";
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
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .order("workspace_id", { ascending: true });

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

  const { data: documentsData, error: documentsError } = await supabase
    .from("documents")
    .select("id, title, source_type, char_count, created_at, deleted_at")
    .eq("workspace_id", primaryWorkspace.id)
    .order("created_at", { ascending: false });

  const { data: scansData, error: scansError } = await supabase
    .from("scans")
    .select("id, document_id, letter_grade, bias_score, total_flags, created_at")
    .eq("workspace_id", primaryWorkspace.id)
    .order("created_at", { ascending: false });

  const { data: flagsData, error: flagsError } = await supabase
    .from("flags")
    .select("status, document_id")
    .eq("workspace_id", primaryWorkspace.id);

  if (documentsError || scansError || flagsError) throw new Error("Could not load workspace audits");
  const allDocuments = (documentsData || []) as DocumentRow[];
  const documents = allDocuments.filter(document => !document.deleted_at);
  const trashedDocuments = allDocuments.filter(document => document.deleted_at);
  const activeIds = new Set(documents.map(document => document.id));
  const scans = ((scansData || []) as ScanRow[]).filter(scan => activeIds.has(scan.document_id));
  const flags = ((flagsData || []) as FlagRow[]).filter(flag => activeIds.has(flag.document_id));

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
  const reviewedFlags = flags.filter(
    (flag) => flag.status !== "open"
  ).length;

  const reviewPercent = totalFlags > 0 ? Math.round(reviewedFlags / totalFlags * 100) : null;

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
                Your workspace
              </h1>
              <p className="text-muted text-lg">Your saved audits and review progress, all in one place.</p>
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
              <p className="section-label mb-3">Review progress</p>
              <p className="font-serif text-5xl leading-none text-rose">
                {reviewPercent === null ? "—" : `${reviewPercent}%`}
              </p>
              <p className="text-xs text-muted mt-2">
                {totalFlags === 0 ? "No findings to review" : `${reviewedFlags} of ${totalFlags} findings reviewed`}
              </p>
              <p className="text-xs text-muted mt-2">Accepted, resolved, or dismissed. Measures review decisions, not document quality.</p>
            </div>

            <div className="bg-white border border-line rounded-sm p-6">
              <p className="section-label mb-3">Open Flags</p>
              <p className="font-serif text-5xl leading-none">
                {totalFlags - reviewedFlags}
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

            <form action="/dashboard" className="flex flex-wrap gap-3 mb-6">
              <label className="flex-1 min-w-48 text-sm">Search audit titles
                <input name="q" defaultValue={search} maxLength={240} placeholder="Find an audit…" className="block w-full border border-line bg-white p-3 mt-1 rounded-sm" />
              </label>
              <button className="self-end bg-ink text-paper px-5 py-3 rounded-sm">Search</button>
              {search ? <Link href="/dashboard" className="self-end py-3 text-rose underline">Clear</Link> : null}
            </form>
            {search ? <p className="text-sm text-muted mb-4">Matching “{search}”. Workspace totals include all active audits.</p> : null}
            {documentsWithScans.filter(document => document.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())).length > 0 ? (
              <div className="space-y-4">
                {documentsWithScans.filter(document => document.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((document) => (
                  <div
                    key={document.id}
                    className="bg-white border border-line rounded-sm p-6 grid md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-6">
                      <p className="font-mono text-[10px] tracking-widest text-rose uppercase mb-2">
                        {document.source_type} • {formatDate(document.created_at)}
                      </p>
                      <h3 className="font-serif text-2xl tracking-tight mb-2">
                        {document.scan ? <Link href={`/audits/${document.scan.id}`} className="hover:text-rose underline decoration-line underline-offset-4">{document.title}</Link> : document.title}
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
                  {search ? "No matching audits." : "No documents audited yet."}
                </p>
                <p className="text-sm text-muted mb-6">
                  {search ? "Try another title or clear your search." : "Run your first audit to start reviewing educational content."}
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
          {trashedDocuments.length > 0 ? <section className="mt-12 border-t border-line pt-8">
            <h2 className="font-serif text-3xl mb-3">Trash</h2>
            <p className="text-sm text-muted mb-5">Trashed audits are kept until restored. Source text and review decisions remain stored; moving to Trash does not permanently erase data.</p>
            <div className="space-y-3">{trashedDocuments.map(document => <div key={document.id} className="bg-white border border-line rounded-sm p-5 flex flex-wrap justify-between gap-4">
              <span>{document.title}</span><AuditTrashButton documentId={document.id} restore />
            </div>)}</div>
          </section> : null}
        </section>
      </main>
    </>
  );
}
