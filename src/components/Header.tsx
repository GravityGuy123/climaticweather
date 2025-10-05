import React from "react";

const Header: React.FC = () => (
  <h2 className="text-3xl font-extrabold mb-4 tracking-tight drop-shadow typewriter-heading gradient-text wave-text">
    {Array.from("Climatic Weather").map((char, i) => (
      <span
        key={i}
        className={`[animation-delay:${i * 0.08}s] inline-block`}
      >
        {char}
      </span>
    ))}
  </h2>
);

export default Header;