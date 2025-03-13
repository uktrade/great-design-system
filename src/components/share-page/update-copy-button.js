export const updateCopyURLButton = (event) => {
  const checkIcon =
    "<svg width='16' height='16' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M184.483 415.759L39.5332 270.809C30.8223 262.098 30.8223 247.986 39.5332 239.275L71.0668 207.741C79.7777 199.031 93.8895 199.031 102.6 207.741L200.25 305.391L409.4 96.2415C418.111 87.5305 432.222 87.5305 440.933 96.2415L472.467 127.775C481.178 136.486 481.178 150.598 472.467 159.309L216.017 415.759C207.306 424.47 193.194 424.47 184.483 415.759Z' fill='#222222'/></svg>";

  event.target.innerHTML = `${checkIcon} Link copied`;
  event.target.setAttribute("iconPrefix", checkIcon);
};
