function videoYT() {

    document.body.style.removeProperty("visibility");
    document.body.classList.add("fade-in");
    document.getElementById("radio").src = "https://s9.citrus3.com:2020/AudioPlayer/worshiplive?mount=&amp;";
    const icon = '<!DOCTYPE html><div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 100vh;"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><rect width="2.8" height="12" x="1" y="6" fill="white"><animate id="svgSpinnersBarsScale0" attributeName="y" begin="0;svgSpinnersBarsScale1.end-0.1s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"/><animate attributeName="height" begin="0;svgSpinnersBarsScale1.end-0.1s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"/></rect><rect width="2.8" height="12" x="5.8" y="6" fill="white"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.1s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"/><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.1s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"/></rect><rect width="2.8" height="12" x="10.6" y="6" fill="white"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"/><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"/></rect><rect width="2.8" height="12" x="15.4" y="6" fill="white"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.3s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"/><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.3s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"/></rect><rect width="2.8" height="12" x="20.2" y="6" fill="white"><animate id="svgSpinnersBarsScale1" attributeName="y" begin="svgSpinnersBarsScale0.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"/><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"/></rect></svg></div>';
    const iframe = document.getElementById("videoplayer");
    const videos = document.querySelectorAll(".video");
    iframe.style.width = "100%";
    iframe.style.aspectRatio = "16 / 9";
    iframe.srcdoc = icon;
    videos.forEach(element => {
        /*
         * Low quality
         * https://img.youtube.com/vi/[video-id]/sddefault.jpg
         *
         * Medium quality
         * https://img.youtube.com/vi/[video-id]/mqdefault.jpg
         *
         * High quality
         * http://img.youtube.com/vi/[video-id]/hqdefault.jpg
         *
         * Maximum resolution
         * http://img.youtube.com/vi/[video-id]/maxresdefault.jpg
         */
        element.setAttribute("src", "https://img.youtube.com/vi/" +
        element.id + "/mqdefault.jpg");
        element.setAttribute("data-bs-toggle", "modal");
        element.setAttribute("data-bs-target", "#videoModal");
        element.style.cursor = "pointer";
        element.addEventListener("click", function (e) {
            iframe.removeAttribute("srcdoc");
            iframe.src = "https://www.youtube.com/embed/" +
                         e.target.getAttribute("id");
        });
    });
    document.getElementById("videoModal")
    .addEventListener("hidden.bs.modal", e => {
        iframe.removeAttribute("src");
        iframe.srcdoc = icon;
    });
    request("/videos.json", (error, data) => {
        if (data.youtube.liveID) {
            let live = document.getElementById("live");
            live.setAttribute("id", data.youtube.liveID);
            live.classList.remove("d-none");
        }
    });
    /*Object.keys(data.youtube.live).forEach(id => {
        if (id) {
            let live = document.getElementById("live");
            live.setAttribute("id", id);
            live.classList.remove("d-none");
            //alert(data.youtube.live[id]);
        }
    });*/
}
function videoPlayer() {
    var video = document.getElementsByTagName("video");
    const len = video.length;
    for (let i = 0; i < len; i++) {
        video[i].addEventListener("play", function () {
            video[i].play();
        }, false);
        video[i].onclick = function () {
            if (video[i].paused) {
                video[i].play();
                video[i].controls = null;
            } else {
                video[i].pause();
                video[i].controls = "controls";
            }
        };
    }
}
