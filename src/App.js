import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => new Promise((resolve, reject) => 
  setTimeout(
    () => resolve({ data: { stories: initialStories }}), 2000)
)

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState);

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value])

  return [value, setValue];
}

const Item = ({item, onRemoveItem}) =>  (
  <div >
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button onClick={()=>onRemoveItem(item)}>Dismiss</button>
      </span>
    </div>
    )

const List = ({list, onRemoveItem}) => 
  list.map(item=>(
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ));

const LableWithSearch = ({id, value, onInputChange,  isFocused, children}) => {
  const inputRef= React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor='search'>{children}</label>
      <input ref={inputRef} id={id} type='text' value={value} onChange={onInputChange} />
    </>
  )
}

const storiesReducer = (state, action) => {
  switch(action.type) {
    case 'INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading:false,
        isError:false,
        data: action.payload
      }
    case 'FAIL':
      return {
        ...state,
        isLoading:false,
        isError:true,
      }
    case 'REMOVE_STORY' :
      return {
        ...state,
        data: state.data.filter(story=>story.objectID !== action.payload)
      }
    // default:
    //   throw new Error();
  }
}

const App = () => {

  const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const [stories, dispatchStories] = React.useReducer(storiesReducer, 
    {
      data : [], isLoading: false, isError: false,
    });


  const fetchStoriesHandler = React.useCallback(async ()=> {
    if (!searchTerm) return;
    console.log(searchTerm);
    dispatchStories({type:'INIT'});
    
    try {
      const result = await axios.get(url);
      dispatchStories({type:'FETCH_SUCCESS', payload: result.data.hits})
    } catch {
        dispatchStories({type:'FAIL'});
    }

  }, [url]);

  React.useEffect(()=>{
    fetchStoriesHandler()
  }, [fetchStoriesHandler]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  }


  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  }

  const handleRemoveItem = (item) => {
    dispatchStories({type:'REMOVE_STORY', payload: item.objectID})
  }

  return (
    <div className="App">
      <LableWithSearch id="search" isFocused value={searchTerm} onInputChange={handleChange}>
        <strong>Search</strong>
      </LableWithSearch>
      <button onClick={handleSearchSubmit}>Search</button>

      {stories.isError && (<p>Something went wrong.</p>)}

      {stories.isLoading ? 
        (<p>Loading...</p>)
        :
        (
      <List list={stories.data} onRemoveItem={handleRemoveItem} />
      )
        }
    </div>
  );
}

export default App;
