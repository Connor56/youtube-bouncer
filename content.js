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
async function checkRedirects(videoTitle, channelName) {
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
      window.location.href = redirectTo;
    }, 2000);
  }
}

function loadBlockerModal(redirectReason) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div class="modal">
      <h2>Redirecting...</h2>
      <p>${redirectReason}</p>
    </div>
  `;
}

function getInfo() {
  // selectors for Youtube video title and channel name
  const videoTitleElement = document.querySelector("#title");
  const channelNameElement = document.querySelector("#text");

  const bothElementsLoadedinDOM = videoTitleElement && channelNameElement;

  console.log("bothElementsLoadedinDOM", bothElementsLoadedinDOM);

  if (bothElementsLoadedinDOM) {
    // clearInterval(checkInterval);

    const videoTitle = videoTitleElement.innerText;
    const channelName = channelNameElement.innerText;

    checkRedirects(videoTitle, channelName);

    console.log(`Video Title: ${videoTitle}`);
    console.log(`Channel: ${channelName}`);
    console.log("Checker wasn't stopped.");
  }
}

// Get the redirects loaded in immediately
getRedirects();

const checkInterval = setInterval(getInfo, 500); // Check every 500ms
