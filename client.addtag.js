const fs = require("fs");

const changeFiles = [
  { filepath: "dist/client.js.html", callback: (text) => `<script type="text/javascript">\n${text}\n</script>` },
  // { filepath: "dist/style.css.html", callback: (text) => `<style type="text/css">${text}</style>` },
];

changeFiles.map(
  async ({ filepath, callback }) =>
    new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filepath, {
        encoding: "utf8",
        highWaterMark: 4096,
      });
      let text = "";

      stream.on("data", (chunk) => (text += chunk.toString("utf8")));

      stream.on("end", () => {
        const rewriteText = callback(text);
        fs.writeFile(filepath, rewriteText, (err) => {
          if (err) reject(err);
          else resolve("タグ配置完了");
        });
      });

      stream.on("error", (err) => reject(err.message));
    })
);
