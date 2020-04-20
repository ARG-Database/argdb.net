var tag_input, tag_list, tag_query_results;
var tag_input_autocomplete, tag_query_submit_button, tag_add_tag_button;
var show_advanced_options_button, show_advanced_options_text;
var query_constraints_container_media_options, query_constraints_container_date_options, query_constraints_container_category_options;
var category_tab_source, category_tab_category, category_tab_date;
var input_cats, input_args, input_type, input_host, input_before, input_after;


var selectedAutocompleteOption;
var autocompleteCache, autocompleteTimeout;
var tags, activeTags;
var argdb_resources;

const argdb_api_host = "http://api.argdb.net/";
const argdb_website_host = "http://www.argdb.net/";

function search_init(){
  tag_input = document.querySelector("input#tag-input");
  tag_list = document.querySelector("ul#active-tags-list");
  tag_query_results = document.querySelector("ul#query-result-list");
  tag_input_autocomplete = document.querySelector("ul#tag-input-autocomplete-list");
  tag_query_submit_button = document.querySelector("button#tag-query-submit-button");
  tag_add_tag_button = document.querySelector("button#add-tag-button");
  show_advanced_options_button = document.querySelector("span#show-advanced-options-button");
  show_advanced_options_text = document.querySelector("span#show-advanced-options-text");
  advanced_options_container = document.querySelector("div#advanced-options-container-container");
  query_constraints_container_media_options = document.querySelector("div#query-constraints-media");
  query_constraints_container_date_options = document.querySelector("div#query-constraints-date");
  query_constraints_container_category_options = document.querySelector("div#query-constraints-category");
  category_tabs_container = document.querySelector("div#advanced-options-category-tabs-container");
  category_tab_source = document.querySelector("li#category-tab-source");
  category_tab_category = document.querySelector("li#category-tab-category");
  category_tab_date = document.querySelector("li#category-tab-date");
  input_cats = document.querySelector("ul#input-cats");
  input_args = document.querySelector("ul#input-args");
  input_type = document.querySelector("ul#input-type");
  input_host = document.querySelector("ul#input-host");
  input_before = document.querySelector("input#input-before");
  input_after = document.querySelector("input#input-after");
  
  tag_input.focus();
  tags = [];
  activeTags = [];
  argdb_resources = {};
  
  loadAllDatabaseResources();
  init_autocomplete();
  disableColorschemes();
  makeTagListItemsRemovable();
  activateAddTagButton();
  activateSendQueryButton();
  setupCategoryTabButtons();
  enableListItemOptions();
  enableAdvancedQueryOptionsButton();
}

function disableColorschemes(){
  Array.from(document.styleSheets).filter(s => s.href.includes("colorschemes")).forEach(s => s.disabled = true); //disable colorschemes
}

function enableColorscheme(name){
  disableColorschemes();
  Array.from(document.styleSheets).filter(s => s.href.endsWith(name + ".css")).forEach(s => s.disabled = false);
}

function makeTagListItemsRemovable(){
  tag_list.addEventListener('click', e => {
    if(e.target.nodeName === 'LI'){
      activeTags = activeTags.filter(t => t !== e.target.textContent);
      console.log("removing: " + e.target.textContent);
      tag_list.removeChild(e.target);
      tag_input.focus();
    }
  });
}

function enableListItemOptions(){
  tag_list.addEventListener('contextmenu', e => {
    if(e.target.nodeName === 'LI'){
      e.preventDefault();
      console.log(e.target);
      tag_input.focus();
    }
  });
}

function activateAddTagButton(){
  tag_add_tag_button.addEventListener('click', e => {
    if(tag_input.value.length){
      applyAutocomplete();
      if(autocompleteCache.length){
        addAutocompletionToTagList();
      }
    }
  });
}

function activateSendQueryButton(){
  tag_query_submit_button.addEventListener('click', e => {
    if(tag_input.value.length){
      applyAutocomplete();
      if(autocompleteCache.length){
        addAutocompletionToTagList();
      }
    }
    clearQueryResultDisplay();
    setQueryIsInProgress();
    queryTagged(activeTags);
  });
}

function setupCategoryTabButtons(){
  category_tab_source.addEventListener('click', e => {
    hideAllCategoryTabs();
    query_constraints_container_media_options.classList.add("advanced-options-container-active");
  });
  
  category_tab_category.addEventListener('click', e => {
    hideAllCategoryTabs();
    query_constraints_container_category_options.classList.add("advanced-options-container-active");
  });
  
  category_tab_date.addEventListener('click', e => {
    hideAllCategoryTabs();
    query_constraints_container_date_options.classList.add("advanced-options-container-active");
  });
}

function hideAllCategoryTabs(){
  query_constraints_container_media_options.classList.remove("advanced-options-container-active");
  query_constraints_container_date_options.classList.remove("advanced-options-container-active");
  query_constraints_container_category_options.classList.remove("advanced-options-container-active");
}

function enableAdvancedQueryOptionsButton(){
  show_advanced_options_button.addEventListener('click', e => {
    if(advanced_options_container.getAttribute("hidden")){
      showAdvancedOptions();
    }else{
      hideAdvancedOptions();
    }
  });
}

function showAdvancedOptions(){
  advanced_options_container.removeAttribute("hidden");
  category_tabs_container.removeAttribute("hidden");
  show_advanced_options_text.innerHTML = "hide advanced query options";
  show_advanced_options_button.innerHTML = "&#x25B4;";
  show_advanced_options_button.style.top = "0.25em";
}

function hideAdvancedOptions(){
  advanced_options_container.setAttribute("hidden", "hidden");
  category_tabs_container.setAttribute("hidden", "hidden");
  show_advanced_options_text.innerHTML = "show advanced query options";
  show_advanced_options_button.innerHTML = "&#x25BE;";
  show_advanced_options_button.style.top = "0.0em";
}

function queryResponse(queryResponseData){
  unsetQueryIsInProgress();
  buildQueryResultDisplay(queryResponseData);
}

function setQueryIsInProgress(){
  document.body.classList.add("query-in-progress");
  tag_query_submit_button.classList.add("query-in-progress");
  tag_query_submit_button.disabled = true;
  tag_input.classList.add("query-in-progress");
  tag_input.disabled = true;
}

function unsetQueryIsInProgress(){
  document.body.classList.remove("query-in-progress");
  tag_query_submit_button.classList.remove("query-in-progress");
  tag_query_submit_button.disabled = false;
  tag_input.classList.remove("query-in-progress");
  tag_input.disabled = false;
}