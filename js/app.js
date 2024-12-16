class vanilaSPA {
    constructor() {
        this.siteName = "Vanila SPA Router",
        /** default page container header, main, footer */
        this.siteHead = "header",
        this.siteMain = "main",
        this.siteFoot = "footer"
    }
    route = (event) => {
        event = event || window.event;
        event.preventDefault();
        window.history.pushState({}, "", event.target.href);            
        this.getPage();
    }
    getPage = async () => { 
        const mainElement = document.querySelector(this.siteMain);   
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
            /** parsing html template content */
            htmc = html.split(/(\n)?<(\/)?template>(\n)?/ig)[4];
            mainElement.innerHTML = htmc;
            /** this is handling title */
            if(part)
                tags = page.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                    return letter.toUpperCase();
                }) + " ~ ";
            document.title = tags+this.siteName;
            /** this is handling hashtags */
            if(this.getHash(1)){
                var getIDElement = document.getElementById(this.getHash(1));
                !getIDElement || window.scrollTo(0, getIDElement.offsetTop);
            }
        }
    }
    getHash = (ints) => {
        const hashData = window.location.hash.split("#");
        return ints > 1 ? hashData[ints] : hashData[1];
    }
}
F3 = new vanilaSPA();
console.log(F3.getHash());
window.onpopstate = F3.getPage;
window.onload = F3.getPage;
document.addEventListener('click', function(event) {    
    /** Check if the clicked element is an <a> tag */ 
    const anchor = event.target.closest('a');    
    if (anchor){
        /** get the href attribute value to check if it starts with # */ 
        const href = anchor.getAttribute('href');
        if (anchor.hasAttribute('href') && !anchor.hasAttribute('target') && !href.startsWith('#')) 
            F3.route(event)
    }
});