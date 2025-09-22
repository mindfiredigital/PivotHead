// "use client";
// import React from "react";
// import { motion } from "motion/react";
// import { cn } from "../lib/utils.ts";

// export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
//   const rows = new Array(150).fill(1);
//   const cols = new Array(100).fill(1);
//   let colors = [
//     "#93c5fd",
//     "#f9a8d4", 
//     "#86efac",
//     "#fde047",
//     "#fca5a5",
//     "#d8b4fe",
//     "#93c5fd",
//     "#a5b4fc",
//     "#c4b5fd",
//   ];
//   const getRandomColor = () => {
//     return colors[Math.floor(Math.random() * colors.length)];
//   };

//   return (
//     <div
//       style={{
//         transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
//       }}
//       className={cn(
//         "boxes-core-container",
//         className,
//       )}
//       {...rest}
//     >
//       {rows.map((_, i) => (
//         <motion.div
//           key={`row` + i}
//           className="boxes-row"
//         >
//           {cols.map((_, j) => (
//             <motion.div
//               whileHover={{
//                 backgroundColor: `${getRandomColor()}`,
//                 transition: { duration: 0 },
//               }}
//               animate={{
//                 transition: { duration: 2 },
//               }}
//               key={`col` + j}
//               className="boxes-col"
//             >
//               {j % 2 === 0 && i % 2 === 0 ? (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth="1.5"
//                   stroke="currentColor"
//                   className="boxes-icon"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M12 6v12m6-6H6"
//                   />
//                 </svg>
//               ) : null}
//             </motion.div>
//           ))}
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// export const Boxes = React.memo(BoxesCore);

"use client"
import React from "react"
import { motion } from "motion/react"
import { useColorMode } from "@docusaurus/theme-common"
import { cn } from "../lib/utils.ts"

const lightColors = ["#93c5fd", "#f9a8d4", "#86efac", "#fde047", "#fca5a5", "#d8b4fe", "#a5b4fc", "#c4b5fd"]
const darkColors = ["#be123c", "#4338ca", "#16a34a", "#ca8a04", "#0891b2", "#7e22ce", "#4f46e5", "#c026d3"]

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const { colorMode } = useColorMode()
  const rows = new Array(150).fill(1)
  const cols = new Array(100).fill(1)
  const colors = colorMode === "dark" ? darkColors : lightColors

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn("boxes-core-container", className)}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div key={`row` + i} className="boxes-row">
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: `${getRandomColor()}`,
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`col` + j}
              className="boxes-col"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="boxes-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)

