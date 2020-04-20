function init_autocomplete(){
  addAutocompleteToTagInput();
  enableTabToAutocomplete();
  enableAutocompleteSelectionByClicking();
  resetAutoCompleteCache();
}

function addAutocompleteToTagInput(){
  tag_input.addEventListener('input', e => {
    console.log(e.target.textLenth);
    if(e.target.value.length > 2){
      if(e.inputType.startsWith('insert')){
        autocompleteCache = autocompleteCache.filter(t => t.toLowerCase().startsWith(e.target.value.toLowerCase()));
        displayAutocomplete();
      }else{
        clearTimeout(autocompleteTimeout);
        autocompleteTimeout = setTimeout(function(){
          if(e.target.value.length > 2){
            resetAutoCompleteCache();
            autocompleteCache = autocompleteCache.filter(t => t.toLowerCase().startsWith(e.target.value.toLowerCase()));
            displayAutocomplete();
          }
        }, 250);
      }
    }else{
      if(e.inputType.startsWith('delete') && autocompleteCache.length > 0){
        console.log("reset");
        resetAutoCompleteCache();
        clearAutocompleteDisplay();
      }
    }
  });
}

function enableTabToAutocomplete(){
  tag_input.addEventListener('keydown', e => {
    if(e.keyCode === 9 || e.which === 9){
      e.preventDefault();
      applyAutocomplete();
    }else if(e.keyCode === 13 || e.which === 13){
      if(!e.ctrlKey){
        if(autocompleteCache.length){
          if(tag_input.value.length){
            applyAutocomplete();
            if(autocompleteCache.length){
              addAutocompletionToTagList();
            }
          }
        }else{
          //COMPLEX IN-DEPTH FUZZY SEARCH FOR TAG
          console.log("TODO: FUZZY SEARCH FOR TAGS NOT MATCHED BY AUTOCOMPLETE"); //TODO
        }
      }else{
        clearQueryResultDisplay();
        setQueryIsInProgress();
        queryTagged(activeTags);
      }
    }else if(e.keyCode === 40 || e.which === 40){
      selectNextAutocompleteSuggestion();
    }else if(e.keyCode === 38 || e.which === 38){
      selectPreviousAutocompleteSuggestion();
    }else if(e.keyCode === 27 || e.which === 27){
      if(tag_input.value){
        tag_input.value = "";
      }else{
        if(activeTags.length){
          let tagToRemove = activeTags.pop();
          tag_list.removeChild(Array.from(tag_list.childNodes).find(n => n.textContent === tagToRemove));
        }else{
          console.log("there are no tags that could be removed");
        }
      }
    }
  });
}

function enableAutocompleteSelectionByClicking(){
  tag_input_autocomplete.addEventListener('click', e => {
    if(e.target.nodeName === 'LI'){
      if(e.target.isEqualNode(selectedAutocompleteOption)){
        applyAutocomplete();
        addAutocompletionToTagList();
      }else{
        selectedAutocompleteOption.classList.remove("selected-autocomplete");
        selectedAutocompleteOption = e.target;
        selectedAutocompleteOption.classList.add("selected-autocomplete");
        //applyAutocomplete();
      }
      tag_input.focus();
    }
  });
  
  tag_input.addEventListener('contextmenu', e => {
    e.preventDefault();
    if(!tag_input.value.length) applyAutocomplete();
  });
}

function addAutocompletionToTagList(){
  //ALSO CHECK FOR DUPLICATES! //TODO
  addActiveTag(tag_input.value);
  tag_input.value = "";
  resetAutoCompleteCache();
  clearAutocompleteDisplay();
}

function addActiveTag(tagName){
  if(!activeTags.includes(tagName)){
    let tagListItem = document.createElement('li');
    tagListItem.textContent = tagName;
    tag_list.appendChild(tagListItem);
    activeTags.push(tagName);
  }else{
    console.log("ignoring duplicate tag");
  }
}

function resetAutoCompleteCache(){
  autocompleteCache = [...tags];
}

function applyAutocomplete(){
  if(tag_input.value.length > 2){
    if(selectedAutocompleteOption){
      tag_input.value = selectedAutocompleteOption.innerHTML; //TODO //make this nicer somehow
    }else{
      tag_input.value = autocompleteCache[0] || tag_input.value || "";
    }
    tag_input.dispatchEvent(
      new InputEvent('input', {
        inputType: "insertByAutocomplete",
        data: tag_input.value
      })
    );
  }else{
    //force autocomplete suggestions
    //idk if this is a good idea (somehow limit this when working with bigger tag lists?)
    resetAutoCompleteCache();
    autocompleteCache = autocompleteCache.filter(t => t.toLowerCase().startsWith(tag_input.value.toLowerCase()));
    displayAutocomplete();
    
    if(selectedAutocompleteOption){
      tag_input.value = selectedAutocompleteOption.innerHTML;
    }
  }
}

function resetAutocompleteSelection(){
  selectedAutocompleteOption = tag_input_autocomplete.firstElementChild;
  if(selectedAutocompleteOption){
    selectedAutocompleteOption.classList.add("selected-autocomplete");
  }
}

function selectNextAutocompleteSuggestion(){
  if(selectedAutocompleteOption){
    selectedAutocompleteOption.classList.remove("selected-autocomplete");
    selectedAutocompleteOption = selectedAutocompleteOption.nextElementSibling || selectedAutocompleteOption;
    selectedAutocompleteOption.classList.add("selected-autocomplete");
  }else{
    resetAutocompleteSelection();
  }
}

function selectPreviousAutocompleteSuggestion(){
  if(selectedAutocompleteOption){
    selectedAutocompleteOption.classList.remove("selected-autocomplete");
    selectedAutocompleteOption = selectedAutocompleteOption.previousElementSibling || selectedAutocompleteOption;
    selectedAutocompleteOption.classList.add("selected-autocomplete");
  }else{
    resetAutocompleteSelection();
  }
}

function clearAutocompleteDisplay(){
  while(tag_input_autocomplete.hasChildNodes()){
    tag_input_autocomplete.removeChild(tag_input_autocomplete.firstChild);
  }
}

function displayAutocomplete(){
  clearAutocompleteDisplay();
  autocompleteCache/*.slice(0, 20)*/.forEach(t => tag_input_autocomplete.appendChild((t => {
    let autocomplete_list_item = document.createElement('li');
    autocomplete_list_item.innerHTML = t;
    return autocomplete_list_item;
  })(t)));
  resetAutocompleteSelection();
}