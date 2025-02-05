import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");

class FileBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute("href", value.url);
    node.setAttribute("target", "_blank");
    node.innerText = value.name;
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("href"),
      name: node.innerText,
    };
  }
}

FileBlot.blotName = "file";
FileBlot.tagName = "a";

Quill.register(FileBlot);

export default FileBlot;
