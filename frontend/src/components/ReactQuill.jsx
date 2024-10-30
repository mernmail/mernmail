import ReactQuill, { Quill } from "react-quill-new";

// Make Quill use inline styles instead of CSS classes
Quill.register(Quill.import("attributors/style/align"), true);
Quill.register(Quill.import("attributors/style/background"), true);
Quill.register(Quill.import("attributors/style/color"), true);
Quill.register(Quill.import("attributors/style/direction"), true);
Quill.register(Quill.import("attributors/style/font"), true);
Quill.register(Quill.import("attributors/style/size"), true);

export { Quill };
export default ReactQuill;
