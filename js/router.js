const mainRoot = window.location.pathname;
const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const handleLocation = async () => {    
    var tags = "",
        path = window.location.pathname,
        part = path.split("/"),
        part = part[part.length - 1].trim();
    const page = part ? part : 'index';
          if(part)
            tags = page.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            }) + " ~ ";
          document.title =  `${tags}Vanilla SPA Router`;

    const urls = part ? path.replace(page, `pages/${page}.html`) : `${path}/pages/index.html`;
    // const route = routes[path] || routes[`${rooter}/404`];
    const html = await fetch(urls).then((data) => data.text());
    document.querySelector("main").innerHTML = html.split(/(\n)?<(\/)?template>(\n)?/ig)[4];
    // console.log(handleHashChange(1));
};

const handleHashChange = (ints) => {
    const hashData = window.location.hash.split("#");
    return ints > 1 ? hashData[ints] : hashData[1];
}
window.onpopstate = handleLocation;
window.onload = handleLocation;
window.route = route;