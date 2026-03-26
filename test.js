const testRender = async () => {
  try {
    const res = await fetch("https://render-deeb-motion-ai.onrender.com/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "export default () => <div>Hello</div>;",
        durationInSeconds: 1,
        ratio: "16:9"
      })
    });
    console.log("Status:", res.status);
    if (!res.ok) {
        console.log("Error body:", await res.text());
        return;
    }
    const buf = await res.arrayBuffer();
    console.log("Received buffer length:", buf.byteLength);
  } catch(e) {
    console.error("Test failed:", e);
  }
};
testRender();
