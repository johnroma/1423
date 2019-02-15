import React, { Component } from "react";
import axios from "axios";
import Result from "./result";

class Searcher extends Component {
  state = {
    error: null,
    isLoaded: false,
    result: [],
    lastquery: "",
    minChars: 1,
    inputActive: false,
    suggestActive: false,
    css: "tips mute"
  };

  async componentDidMount() {
    const apiKey = "c857fccf3354f1ca866dc08a04b4be34";
    this.url = "https://api.themoviedb.org/4/search/movie?api_key=" + apiKey;
    await this.getSearch("testquery");
    document.addEventListener("mousedown", this.handleOutsideClick, false);
  }

  extractDetails(arr) {
    let filtered = this.filterRegMatch(arr);

    return filtered.map(pos => {
      const { id, title, release_date } = pos;
      return { id: id, title: title, extra: release_date };
    });
  }

  filterRegMatch(arr) {
    let { lastquery } = this.state;
    let regex = new RegExp(`\\b^${lastquery}`, "gi");
    let filtered = arr.filter(function(pos) {
      return regex.test(pos.title);
    });
    return filtered;
  }

  async getSearch(query) {
    try {
      let data = await this.getJson(
        this.url + "&query=" + query + "&include_adult=false&sort_by=title.asc"
      );

      const r =
        query === "testquery"
          ? { isLoaded: true }
          : { isLoaded: true, result: this.extractDetails(data.results) };
      this.setState(r);
    } catch (error) {
      this.setState({
        isLoaded: true,
        error
      });
      console.warning(
        "There has been a problem with your fetch operation: ",
        error.message
      );
    }
  }

  async getJson(url) {
    let res = await axios.get(url);

    if (res.status === 200) {
      let json = await res.data;
      return json;
    }

    throw new Error(res.status);
  }

  handleOutsideClick = e => {
    // ignore clicks on the component itself
    if (this.node.contains(e.target)) {
      return;
    }
    // this.hideSuggestions();
  };

  handleChange = e => {
    if (e.target.value === " " || e.target.value === "") {
      e.target.value = "";
      this.setState({ css: "tips mute" });
    } else this.setState({ css: "tips show" });

    this.setState({
      lastquery: e.target.value,
      inputActive: true
    });

    this.search(e, 100);
  };

  handleBlur = e => { 
    let pos = parseInt(e.target.getAttribute("pos"),10);
    let tag = e.target.tagName;
     if (tag === "INPUT" || tag === "BUTTON") {
      
       console.log('state.suggestActive:',this.state.suggestActive);
       
      this.setState({ inputActive: false });
     }
     else if (tag === "LI"){
      this.setState({ suggestActive: false });
       if(pos===this.state.result.length-1 && pos!==0) {
      // this.setState({ suggestActive: false });
    }
    else if(pos===0){
     
      console.log('handleBLUR LI POS 0');this.setState({ suggestActive:false})
      
      
    }
  }


  console.log('this.state.suggestActive' , this.state.suggestActive, '**' ,this.state.inputActive);
  
  if (!this.state.suggestActive && !this.state.inputActive)
    console.log('trap');
    
  //  this.setState({  css: "tips mute" });
  };

  handleFocus = e => {

    console.log('handleFocus: ',e.target.tagName);
    
    let tag = e.target.tagName;
     if (tag === "INPUT" || tag === "BUTTON") {
      this.setState({ inputActive: true });
      if (this.state.lastquery.length) this.setState({ css: "tips show" });
     } else if (tag === "LI") {
      console.log('FOCUS ING LI');
     

       this.setState({ css: "tips show", suggestActive: true });
     }
    this.search(e, 10);
  };

  handleQueryPostSelect = movie => {
    this.inpt.value = movie.title;
    this.setState({ lastquery: movie.title });

    let date = new Date();
    const saveTime = date.getTime();

    let stampedMovie = { ...movie, saveTime };
    this.props.onAddMovie(stampedMovie);

    this.inpt.focus();
    // this.hideSuggestions();
  };

  search = (e, ms) => {
    // if (e.target.id !== "list-suggestions") {
      if (e.target.value.length >= this.state.minChars) {
        this.resetTimer(ms, e.target.value);
      } else {
        clearTimeout(this.searchTimeout);
        // this.setState({ result: [] });
      }
    // }
  };

  hideSuggestions() {
    this.setState({
      css: "tips mute",
      suggestActive: false,
      inputActive: false,
      result: []
    });
  }

  resetTimer(ms, inputString) {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(async () => {
      await this.getSearch(inputString);
      this.setState({ lastquery: inputString });
    }, ms);
  }

  clearInput = () => {
    this.inpt.value = "";
    this.hideSuggestions();
    this.setState({ result: [] });
  };
  render() {
    const { error, result, lastquery, minChars } = this.state;

    if (error) {
      return <div>Sorry, search is not possible: {error.message}</div>;
    } else {
      return (
        <div
          ref={node => {
            this.node = node;
          }}
        >
          <div className="search">
            <input
              ref={inpt => {
                this.inpt = inpt;
              }}
              placeholder="..."
              type="text"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              autoComplete="off"
              id="searchfield"
              onFocus={this.handleFocus}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
            />
            <button onClick={this.clearInput} onBlur={this.handleBlur} onFocus={this.handleFocus} className="icon clear" />
          </div>

          <div className={this.state.css}>
            <Result
              query={lastquery}
              minChars={minChars}
              result={result}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              onQueryPostSelect={this.handleQueryPostSelect}
            />
          </div>
        </div>
      );
    }
  }
}

export default Searcher;
