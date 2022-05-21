export default function home({ html, setHead }) {
  setHead(html`<title>Hello Home</title>`);
  const welcome = "Welcome Home";
  return html`<h1>${welcome}</h1>`;
}
