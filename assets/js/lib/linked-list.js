import { removeAccents } from "./other.js";

function SinglyLinkedListNode(data) {
  this.data = data;
  this.next = null;
}

function SinglyLinkedList() {
  this.head = null;
  this.size = 0;
}

SinglyLinkedList.prototype.isEmpty = () => this.size === 0;

SinglyLinkedList.prototype.insert = function insert(value) {
  if (this.head === null) {
    this.head = new SinglyLinkedListNode(value);
  } else {
    const tmp = this.head;
    this.head = new SinglyLinkedListNode(value);
    this.head.next = tmp;
  }
  this.size += 1;
};

SinglyLinkedList.prototype.remove = function remove(value) {
  let currentHead = this.head;
  if (currentHead.data === value) {
    this.head = currentHead.next;
    this.size -= 1;
    return currentHead.data.id;
  }
  let prev = currentHead;
  while (currentHead.next) {
    if (currentHead.data === value) {
      prev.next = currentHead.next;
      prev = currentHead;
      currentHead = currentHead.next;
      return prev.data.id;
    }
    prev = currentHead;
    currentHead = currentHead.next;
  }
  if (currentHead.data === value) {
    prev.next = null;
  }
  this.size -= 1;
  return currentHead.id;
};

SinglyLinkedList.prototype.print = function print(append, container) {
  let { head } = this;
  while (container.firstElementChild) {
    container.removeChild(container.firstElementChild);
  }
  while (head !== null) {
    append(container, head.data);
    head = head.next;
  }
};

SinglyLinkedList.prototype.search = function search(searchValue, container, append) {
  let { head } = this;
  while (container.firstElementChild) {
    container.removeChild(container.firstElementChild);
  }
  while (head !== null) {
    let { name } = head.data.information;
    let value = searchValue;
    name = removeAccents(name).toLowerCase();
    value = removeAccents(searchValue).toLowerCase();
    if (name.indexOf(value) !== -1) append(container, head.data);
    head = head.next;
  }
};

// const sll1 = new SinglyLinkedList();
// sll1.insert(1); // linked list is now: 1 -> null
// sll1.insert(3); // linked list is now: 3 -> 1 -> null
// sll1.remove(3);
// sll1.print();

export default SinglyLinkedList;
