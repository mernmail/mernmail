import { forwardRef } from "react";
import PropTypes from "prop-types";

const Iframe = forwardRef((props, ref) => {
  const isCompliant = !!("srcdoc" in document.createElement("iframe"));
  if (isCompliant) {
    return <iframe ref={ref} {...props} />;
  } else {
    const { src, srcDoc, ...otherProps } = props;
    const finalSrc = srcDoc ? `data:text/html;base64,${btoa(srcDoc)}` : src;
    return <iframe ref={ref} src={finalSrc} {...otherProps} />;
  }
});

Iframe.displayName = "Iframe";

Iframe.propTypes = {
  src: PropTypes.string,
  srcDoc: PropTypes.string
};

export default Iframe;
