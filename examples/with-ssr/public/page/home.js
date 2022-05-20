export default function home({ html, useSSR }) {
  useSSR({
    head: html`<title>Hello Home</title>`,
  });
  const welcome = "Welcome Home";
  return html`<h1 id="title">${welcome}</h1>`;
}
