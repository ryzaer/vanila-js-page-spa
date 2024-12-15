const   siteName = "Vanilla SPA Router",
        siteBody = "main",
        route = (event) => {
            event = event || window.event;
            event.preventDefault();
            window.history.pushState({}, "", event.target.href);            
            handleLocation();
        },
        handleLocation = async () => { 
            const mainElement = document.querySelector(siteBody);   
            var tags = "",
                path = window.location.pathname,
                part = path.split("/"),
                part = part[part.length - 1].trim(),
                page = part ? part : 'index';
            /** make clear that content is not the same content*/
            if(mainElement.getAttribute("content") !== page){
                /*var urls = part ? path.replace(page, `pages/${page}.html`) : `${path}/pages/index.html`,*/
                var urls = part ? path.replace(page, `pages/${page}`) : `${path}/pages/index`,
                    html = await fetch(urls).then((data) => data.text()),
                    htmc;
                mainElement.setAttribute('content',page);
                /** handle error page 4** to 5** */
                if(html.match(/<title>(\s+)?(4|5)\d{1,2}\s/)){
                    html = await fetch(urls.replace(page,'404')).then((data) => data.text());
                    page = '404 ' +  page + ' Page Not Found';
                }
                htmc = html.split(/(\n)?<(\/)?template>(\n)?/ig)[4];
                mainElement.innerHTML = htmc;

                if(part)
                    tags = page.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                        return letter.toUpperCase();
                    }) + " ~ ";
                document.title = tags+siteName;
                /** this is handling hashtags */
                if(handleHashChange(1)){
                    var getIDElement = document.getElementById(handleHashChange(1));
                    !getIDElement || window.scrollTo(0, getIDElement.offsetTop);
                }
            }
        },
        handleHashChange = (ints) => {
            const hashData = window.location.hash.split("#");
            return ints > 1 ? hashData[ints] : hashData[1];
        };
window.onpopstate = handleLocation;
window.onload = handleLocation;
document.addEventListener('click', function(event) {
    
    /** 
     Check if the clicked element is an <a> tag
     * */ 
    const anchor = event.target.closest('a');    
    if (anchor){
        const href = anchor.getAttribute('href');
        if (anchor.hasAttribute('href') && !anchor.hasAttribute('target') && !href.startsWith('#')) 
            route(event)
    }
});