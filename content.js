let redirects;

/**
 * Get the redirects from the redirects.json file
 * @returns {Promise<Object>} The redirects object
 */
async function getRedirects() {
  const redirectsUrl = chrome.runtime.getURL("redirects.json"); // or 'data/data.json' if in a subfolde

  const response = await fetch(redirectsUrl);

  const data = await response.json();

  console.log("redirects loaded:", data);

  redirects = data;

  return data;
}

/**
 * Check if the video title or channel name is in the redirects object
 * @param {string} videoTitle - The title of the video
 * @param {string} channelName - The name of the channel
 */
async function checkForARedirect(videoTitle, channelName) {
  const titleFilters = redirects.titleFilters;
  const channelFilters = redirects.channelFilters;

  let redirectTo;
  let redirectReason;

  for (const titleFilter of titleFilters) {
    if (videoTitle.toLowerCase().includes(titleFilter.searchTerm.toLowerCase())) {
      redirectTo = titleFilter.redirectTo || redirects.defaultRedirect;
      redirectReason = titleFilter.reason || "Title filter";
    }
  }

  for (const channelFilter of channelFilters) {
    if (channelName.toLowerCase().includes(channelFilter.user.toLowerCase())) {
      redirectTo = channelFilter.redirectTo || redirects.defaultRedirect;
      redirectReason = channelFilter.reason || "Channel filter";
    }
  }

  const userIsRedirected = redirectTo !== undefined;

  if (userIsRedirected) {
    loadBlockerModal(redirectReason);

    setTimeout(() => {
      pageHasBeenChecked = false;
      window.location.href = redirectTo;
    }, 4000);
  }
}

function loadBlockerModal(redirectReason) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.8)";
  modal.style.zIndex = "99999";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.color = "white";
  modal.style.fontSize = "2em";
  modal.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2>Redirecting...</h2>
      <p>${redirectReason}</p>
    </div>
  `;
  document.body.appendChild(modal);
}

function getInfo() {
  const isWatchPage = /youtube\.com\/watch/.test(window.location.href);
  if (!isWatchPage) {
    console.log("not a watch page");
    return;
  }

  // selectors for Youtube video title and channel name
  const videoTitleElement = document.querySelector("h1.ytd-watch-metadata yt-formatted-string");
  const channelNameElement = document.querySelector("ytd-channel-name a.yt-simple-endpoint");

  const bothElementsLoadedinDOM = videoTitleElement && channelNameElement;

  if (bothElementsLoadedinDOM) {
    const videoTitle = videoTitleElement.innerText;
    const channelName = channelNameElement.innerText;

    checkForARedirect(videoTitle, channelName);

    console.log("videoTitle", videoTitle);
    console.log("channelName", channelName);
  }
}

getRedirects();

const checkInterval = setInterval(getInfo, 2000);
