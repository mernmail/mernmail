import ReactQuill, { Quill } from "react-quill-new";

// Make Quill use inline styles instead of CSS classes
Quill.register(Quill.import("attributors/style/align"), true);
Quill.register(Quill.import("attributors/style/background"), true);
Quill.register(Quill.import("attributors/style/color"), true);
Quill.register(Quill.import("attributors/style/direction"), true);
Quill.register(Quill.import("attributors/style/font"), true);
Quill.register(Quill.import("attributors/style/size"), true);

// Use <pre> tags for code blocks
const Block = Quill.import("blots/block");

class CustomCode extends Block {
  static blotName = "code-block";
  static tagName = "pre";
}

Quill.register("formats/code-block", CustomCode, true);

export { Quill };
export default ReactQuill;
