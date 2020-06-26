function Modal(options) {
  this.options = options;
  this.modalElement = document.querySelector(this.options.modalSelector);
}

Modal.prototype.show = function showModal() {
  this.modalElement.classList.remove("d-none");
};

Modal.prototype.hide = function hideModal() {
  this.modalElement.classList.add("d-none");
};

export default Modal;
