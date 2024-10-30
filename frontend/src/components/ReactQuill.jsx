import ReactQuill, { Quill } from "react-quill-new";

// Make Quill use inline styles instead of CSS classes
Quill.register(Quill.import("attributors/style/align"));
Quill.register(Quill.import("attributors/style/background"));
Quill.register(Quill.import("attributors/style/color"));
Quill.register(Quill.import("attributors/style/direction"));
Quill.register(Quill.import("attributors/style/font"));
Quill.register(Quill.import("attributors/style/size"));

export { Quill };
export default ReactQuill;
