// import React from "react";

// export default function FormRow({ children, cols = 2 }) {
//   return (
//     <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
//       {children}
//     </div>
//   );
// }


import React from "react";

export default function FormRow({ children, cols = 2 }) {
  const colClass =
    cols === 1 ? "md:grid-cols-1" :
    cols === 2 ? "md:grid-cols-2" :
    cols === 3 ? "md:grid-cols-3" :
    cols === 4 ? "md:grid-cols-4" :
    "md:grid-cols-2"; // default fallback

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4`}>
      {children}
    </div>
  );
}
