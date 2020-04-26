function argdbAPIRequest(apiResource, apiRequestParameters, onSuccessCallback, onFailCallback, onDoneCallback){
  var apiRequest = new XMLHttpRequest();
  apiRequest.open("GET", argdb_api_host + apiResource + apiRequestParameters);
  apiRequest.onreadystatechange = function(){
    if(apiRequest.readyState === 4){
      if(apiRequest.status === 200){
        if(onSuccessCallback){
          onSuccessCallback(apiRequest.responseText);
        }else{
          console.log("No success callback set. logging response.");
          console.log(apiRequest.response);
        }
      }else if(apiRequest.status === 0){
        //no answer from API server / API Server offline
        console.log("Couldn't reach API Server");
        if(onFailCallback) onFailCallback(apiRequest.responseText, apiRequest.status, "API Server not responding");
        //TODO: display error to user
      }else{
        //idk if onFailCallback is even necessary or if fail can be handled by a general case (just displaying an error to the user) //REVIEW
        if(onFailCallback) onFailCallback(apiRequest.responseText, apiRequest.status, apiRequest.statusText);
        //TODO: display error to user
      }
      if(onDoneCallback) onDoneCallback();
    }
  };
  apiRequest.send();
  console.log("ARGDB API Query: " + argdb_api_host + apiResource + apiRequestParameters);
}

var argdb_databaseResourceNames = {
  tags: {name: "TagName", maxAge: 2},
  cats: {name: "CategoryName", maxAge: 8},
  args: {name: "ARG_Name", maxAge: 32},
  types: {name: "SourceType", maxAge: 16},
  hosts: {name: "SourceHost", maxAge: 16},
};

function loadDatabaseResource(resourceName, maxValidCacheAgeInDays, forceResync){
  if(!Object.keys(argdb_databaseResourceNames).includes(resourceName)){console.log("invalid resourceName: ", resourceName); return;}
  let resourceCache = JSON.parse(localStorage.getItem('argdb_apidata_cache_' + resourceName));
  console.log("cached", resourceName, ":", resourceCache);
  if(!resourceCache || forceResync || ((new Date().getTime() - new Date(resourceCache.meta.date).getTime()) > 1000 * 60 * 60 * 24 * maxValidCacheAgeInDays)){
    //the cached resource list will be updated if it's older than <maxValidCacheAgeInDays> days
    //observe the rate at which new resources are added to adjust the respective validity timeframe of cached resources
    console.log("no valid cached " + resourceName + " found. synchronizing " + resourceName.slice(0, -1) + " list with database / requesting current " + resourceName.slice(0, -1) + " list...");
    argdbAPIRequest("get/" + resourceName, "", function(apiResponseText, apiResponseStatus, apiResponseStatusText){
      console.log("successfully loaded " + resourceName + " from ARG Database");
      argdb_resources[resourceName] = JSON.parse(apiResponseText).data/*.map(d => d[argdb_databaseResourceNames[resourceName]name])*/.sort(); //implement binary search? //TODO
      //now that the resources are sorted, I could theoretically do some binary search on the list
      //compare the speed/efficiency of binary sort and the regular .filter() method sometime... //REVIEW
      let toCache = {
        meta: {date: new Date(), resourceName: resourceName},
        ["cached_" + resourceName]: argdb_resources[resourceName]
      };
      localStorage.setItem('argdb_apidata_cache_' + resourceName, JSON.stringify(toCache));
    }, function(apiResponseText, apiResponseStatus, apiResponseStatusText){
      console.log("Query failed.");
      console.log("Status: " + apiResponseStatus + " - " + apiResponseStatusText);
      console.log(apiResponseText);
      console.log("falling back on locally cached but outdated " + resourceName.slice(0, -1) + " list if available.");
      argdb_resources[resourceName] = resourceCache["cached_" + resourceName];
      console.warn(
        "The cached " + resourceName.slice(0, -1) + " list is not up to date. Last synchronization with the database: "+
        ((new Date().getTime() - new Date(resourceCache.meta.date).getTime())/(1000 * 60 * 60 * 24)).toFixed(2)+
        " days ago"
      );
    }, function(){
      if(resourceName === "tags"){
        tags = argdb_resources.tags;
        resetAutoCompleteCache();
      }
    });
  }else{
    argdb_resources[resourceName] = resourceCache["cached_" + resourceName];
    if(resourceName === "tags"){
      tags = argdb_resources.tags;
      resetAutoCompleteCache();
    }
  }
}

function loadAllDatabaseResources(){
  Object.keys(argdb_databaseResourceNames).forEach(r => loadDatabaseResource(r, argdb_databaseResourceNames[r].maxAge));
}

function getQueryParameterString(){
  let queryParamStr = activeTags.map(s => "&tags=" + s).join("");
  queryParamStr += Array.from(input_cats.children).filter(c => c.firstChild.checked).map(c => "&cats=" + c.textContent).join("");
  queryParamStr += Array.from(input_args.children).filter(c => c.firstChild.checked).map(c => "&args=" + c.textContent).join("");
  queryParamStr += Array.from(input_type.children).filter(c => c.firstChild.checked).map(c => "&type=" + c.textContent).join("");
  queryParamStr += Array.from(input_host.children).filter(c => c.firstChild.checked).map(c => "&host=" + c.textContent).join("");
  queryParamStr += (input_before.value ? "&before=" + input_before.value : "");
  queryParamStr += (input_after.value ? "&after=" + input_after.value : "");
  if(queryParamStr.length){queryParamStr = "?" + queryParamStr.slice(1);}
  return queryParamStr;
}

function queryTagged(){
  setQueryIsInProgress();
  hideAdvancedOptions();
  argdbAPIRequest("get/tagged", getQueryParameterString(), function(apiResponseText){
    //also make the API query descriptions if existing, but don't display the whole description on the search page (?) //TODO
    //display keywords from the description, so I can finally use the keyword generator
    let responseData = JSON.parse(apiResponseText).data;
    queryResponse(responseData);
    sessionStorage.setItem('argdb_request_response_cache', JSON.stringify(responseData));
  }, onRequestFailedDefaultCallback, unsetQueryIsInProgress);
}

function onRequestFailedDefaultCallback(apiResponseText, apiResponseStatus, apiResponseStatusText){
  console.log("Query failed");
  console.log("Status: " + apiResponseStatus + " - " + apiResponseStatusText);
  console.log(apiResponseText);
}