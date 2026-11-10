let queue = Promise.resolve();
function show(message, confirmation) {
  return new Promise(resolve => {
    const previous = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "app-dialog";
    dialog.setAttribute("aria-labelledby", "app-dialog-title");
    dialog.setAttribute("aria-describedby", "app-dialog-description");
    const title = document.createElement("h2");
    title.id = "app-dialog-title"; title.textContent = confirmation ? "Confirm action" : "Unable to complete action";
    const description = document.createElement("p");
    description.id = "app-dialog-description"; description.textContent = message;
    const footer = document.createElement("div"); footer.className = "app-dialog-actions";
    const finish = value => { dialog.close(); dialog.remove(); previous?.focus?.(); resolve(value); };
    if (confirmation) {
      const cancel = document.createElement("button"); cancel.textContent = "Cancel"; cancel.onclick = () => finish(false); footer.append(cancel);
    }
    const accept = document.createElement("button"); accept.textContent = confirmation ? "Confirm" : "Close"; accept.className = "dialog-primary"; accept.onclick = () => finish(true); footer.append(accept);
    dialog.append(title, description, footer); document.body.append(dialog);
    dialog.addEventListener("cancel", event => {event.preventDefault();finish(false);});
    dialog.addEventListener("click", event => {if(event.target === dialog){ const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) finish(false); }});
    dialog.showModal(); footer.firstChild.focus();
  });
}
function enqueue(message, confirmation) {
  const result = queue.then(() => show(message, confirmation));
  queue = result.catch(() => {});
  return result;
}
export const confirmAction = message => enqueue(message, true);
export const notifyUser = message => enqueue(message, false);
