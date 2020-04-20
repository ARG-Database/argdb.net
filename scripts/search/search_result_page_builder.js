function buildQueryResultDisplay(queryResponseData){
  clearQueryResultDisplay();
  queryResponseData.forEach(qrd => buildQueryResult(qrd));
}

function buildQueryResult(r){
  let queryResultListItem = document.createElement('li');
  queryResultListItem.classList.add("query-result");
  let queryResultSourceHostIcon = document.createElement('img');
  queryResultSourceHostIcon.src = getSourceHostIconSrc(r.SourceHost);
  queryResultSourceHostIcon.alt = r.SourceHost;
  queryResultSourceHostIcon.title = r.SourceHost;
  queryResultSourceHostIcon.classList.add("query-result-source-host");
  queryResultSourceHostIcon.classList.add("icon");
  let queryResultTitle = document.createElement('span');
  queryResultTitle.classList.add("query-result-title");
  queryResultTitle.textContent = r.ClueTitle || ("Clue #" + r.ClueID);
  let queryResultSourceDate = document.createElement('span');
  queryResultSourceDate.classList.add("query-result-source-date");
  queryResultSourceDate.textContent = new Date(r.SourceDate).toLocaleDateString();
  let queryResultSourceType = document.createElement('span');
  queryResultSourceType.classList.add("query-result-source-type");
  queryResultSourceType.textContent = getSourceTypeStr(r.SourceType);
  let queryResultARGIcon = document.createElement('img');
  queryResultARGIcon.src = getARGIcon(r.ARG_Name);
  queryResultARGIcon.classList.add("query-result-arg");
  queryResultARGIcon.classList.add("icon-small");
  queryResultARGIcon.alt = r.ARG_Name;
  queryResultARGIcon.title = r.ARG_Name;
  let queryResultClearDIV = document.createElement('div');
  queryResultClearDIV.classList.add("query-result-clear");
  
  queryResultListItem.appendChild(queryResultSourceHostIcon);
  queryResultListItem.appendChild(queryResultTitle);
  queryResultListItem.appendChild(queryResultSourceType);
  queryResultListItem.appendChild(queryResultSourceDate);
  queryResultListItem.appendChild(queryResultARGIcon);
  queryResultListItem.appendChild(queryResultClearDIV);
  
  tag_query_results.appendChild(queryResultListItem);
}

function clearQueryResultDisplay(){
  while(tag_query_results.hasChildNodes()){
    tag_query_results.removeChild(tag_query_results.firstChild);
  }
}

function getARGIcon(ARGName){
  switch(ARGName){
    case "Cyberpunk 2077": return "../icons/cyberpunk2077.png";
    default: return "../icons/unknown.png";
  }
}

function getSourceTypeStr(sourceType){
  switch(sourceType){
    case "image": return "[IMAGE]";
    case "video": return "[VIDEO]";
    case "website": return "[WEBSITE]";
    case "string": return "[STRING]";
    case "text": return "[TEXT]";
    case "file": return "[FILE]";
    case "audio-file": return "[AUDIO]";
    case "document": return "[DOC]";
    default: return "[???]";
  }
}

function getSourceHostIconSrc(sourceHost){
  switch(sourceHost){
    case "Twitter": return "../icons/SourceHosts/twitter.png";
    case "YouTube": return "../icons/SourceHosts/youtube.png";
    case "Twitch": return "../icons/SourceHosts/twitch.png";
    case "Reddit": return "../icons/SourceHosts/reddit.png";
    case "Discord": return "../icons/SourceHosts/discord.png";
    case "ARG related": return "../icons/SourceHosts/arg_related.png";
    default: return "icons/SourceHosts/other.png";
  }
}


//  BRANDING COLORS
//TWITTER #1DA1F2
//TWITCH #9146FF
//REDDIT #FF4500
//YOUTUBE #FF0000
//DISCORD ##7289DA

//CYBERPUNK #FCEE09