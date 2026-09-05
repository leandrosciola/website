const DOM = {
  dialog: document.querySelector('dialog'),
  dialogText: document.querySelector('dialog p'),
  dialogClose: document.querySelector('dialog button')
};

if (DOM.dialog) {
  DOM.dialogClose?.addEventListener('click', () => DOM.dialog?.close());
}

window.dialog = (data) => {
  DOM.dialogText.innerText = data;
  DOM.dialog?.showModal();
};
