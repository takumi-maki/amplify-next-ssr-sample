import RevalidateTest from "@/components/revalidate";

export default async function Page() {
  const fuga = await fetch("http://localhost:3000/api", {
    next: { tags: ["test-revalidate"] },
  });
  const resp = await fuga.json();
  return (
    <>
      <div>apiresponse: {JSON.stringify(resp)}</div>
      <div>
        <RevalidateTest />
      </div>
    </>
  );
}
