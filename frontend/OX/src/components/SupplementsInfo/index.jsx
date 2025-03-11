import React from "react";

const Index = ({ url, title, id }) => {
  return (
    <div>
      <div className="flex mt-5 rounded-3xl drop-shadow-2xl flex-col w-80 md:w-96 align-middle bg-white">
        <div className="flex my-3 justify-center">
          <img
            className="rounded-xl"
            src={url}
            height="300px"
            width="300px"
            alt={title}
          />
        </div>
        <p className="text-black text-lg md:text-lg text-center">
          {title}{" "}
          <a
            href="#"
            onClick={() => {
              console.log(id);
            }}
          >
            Get Info
          </a>
        </p>
      </div>
    </div>
  );
};

export default Index;
