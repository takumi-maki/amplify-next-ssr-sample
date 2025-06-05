import RevalidateTest from "@/components/revalidate";

export default async function Page() {
  const fuga = await fetch("https://main.d1zjxntokfr2e6.amplifyapp.com/api", {
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
