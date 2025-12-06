const Footer = () => {
  return (
    <footer className="bg-card py-2 text-gray-300">
      <div className="container text-center">
        <p className="text-xs">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/shakurt/expression-notation-converter"
            target="_blank"
            className="underline"
          >
            Expression Notation Converter
          </a>
          . All rights reserved.
          {" • "}Developed by{" "}
          <a
            href="https://github.com/shakurt"
            target="_blank"
            className="underline"
          >
            <span className="font-semibold">ThePrimeShak</span>
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
