export default async function home({ html }) {
  const welcome = "Welcome Home";
  return html`<h1 id="title">${welcome}</h1>`;
}
