import React from 'react';
import logo from './logo.svg';
import './App.css';


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
    console.log(value);
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

const LableWithSearch = ({id, value, onInputChange, onSearchClick, isFocused, children}) => {
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
      <button type='button' onClick={onSearchClick}>Search</button>
    </>
  )
}

const storiesReducer = (state, action) => {
  switch(action.type) {
    case 'SET_STORIES':
      return action.payload;
    case 'REMOVE_STORY' :
      return state.filter(story=>story.objectID !== action.payload);
    default:
      throw new Error();
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [stories, dispatchStories] = React.useReducer(storiesReducer, []);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isError, setIsError] = React.useState(false);

  React.useEffect(()=>{
    setIsLoading(true);
    getAsyncStories().then(result=> {
      setIsLoading(false);
      dispatchStories({type:'SET_STORIES', payload: result.data.stories})
    }).catch(()=> {
      setIsLoading(false);
      setIsError(true);
    })
    ;
  }, []);


  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  }

  const handleSubmitSearch = () => {
    dispatchStories({type:'SET_STORIES', payload: initialStories.filter(story => story.title.toLowerCase().includes( searchTerm.toLowerCase() ))})
  }

  const handleRemoveItem = (item) => {
    dispatchStories({type:'REMOVE_STORY', payload: item.objectID})
  }

  return (
    <div className="App">
      <LableWithSearch id="search" isFocused onSearchClick={handleSubmitSearch} value={searchTerm} onInputChange={handleChange}>
        <strong>Search</strong>
      </LableWithSearch>
      {isError && (<p>Something went wrong.</p>)}

      {isLoading ? 
        (<p>Loading...</p>)
        :
        (
      <List list={stories} onRemoveItem={handleRemoveItem} />
      )
        }
    </div>
  );
}

export default App;
