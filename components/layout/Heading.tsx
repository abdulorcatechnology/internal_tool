import React from "react";

const Heading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </>
  );
};

export default Heading;
