import React from 'react';
import logo from './logo.svg';
// import styles from './App.module.css';
import axios from 'axios';
import cs from 'classnames';
import styled from 'styled-components';
import { ReactComponent as Check } from './check.svg';

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;

  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);

  color: #171212;
  `;

const StyledHeadlinePrimary = styled.h1`
  font-size : 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
  `;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a{
    color: inherit;
  }

  width: ${props => props.width};
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;

  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }
`;

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;

  &:hover {
    svg{
      g{
        fill: #ffffff;
        stroke: #ffffff;
      }
    }
  }
  `;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
  `;

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
  `;

const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size:24px;
  `;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;

  font-size: 24px;
  `;


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
  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState);

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A');
      localStorage.setItem(key, value);
    }
  }, [value])

  return [value, setValue];
}

const getSumComments = data => {
  console.log('C');
  return data.reduce((result, value) => result + value.num_comments, 0);
}

const Item = ({item, onRemoveItem}) =>  (
  <StyledItem>
      <StyledColumn width="40%">
        <a href={item.url}>{item.title}</a>
      </StyledColumn>
      <StyledColumn width="30%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points}</StyledColumn>
      <StyledColumn width="10%">
        <StyledButtonSmall type='button' onClick={()=>onRemoveItem(item)}>
          <Check height="18px" width="18px" />
        </StyledButtonSmall>
      </StyledColumn>
  </StyledItem>
)

const List =
  React.memo(
 ({list, onRemoveItem}) => 
  console.log('B:List') ||
  list.map(item=>(
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))
);

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

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  }


  const handleSearchSubmit = (e) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    e.preventDefault();
  }

  const handleRemoveItem = 
    React.useCallback(
      item => {
        dispatchStories({type:'REMOVE_STORY', payload: item.objectID})
      }
      , []);

  console.log('B:App');


  const sumComments = React.useMemo( () => getSumComments(stories.data) , [stories]);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories with {sumComments} comments.</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
        />
      

      {stories.isError && (<p>Something went wrong.</p>)}

      {stories.isLoading ? 
        (<p>Loading...</p>)
        :
        (
      <List list={stories.data} onRemoveItem={handleRemoveItem} />
      )
        }
    </StyledContainer>
  );
}

const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit}) => (
  <StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel id="search" isFocused value={searchTerm} onInputChange={onSearchInput}>
      <strong>Search</strong>
    </InputWithLabel>
    <StyledButtonLarge disabled={!searchTerm}>Search</StyledButtonLarge>
  </StyledSearchForm>
)

class InputWithLabel extends React.Component {

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if(this.props.isFocused) {
      this.inputRef.current.focus();
    }
  }

  render() {
    const {id, value, onInputChange,  isFocused, children} = this.props;

    return (
      <>
        <StyledLabel htmlFor={id}>{children}</StyledLabel>
        <StyledInput ref={this.inputRef} id={id} type='text' value={value} onChange={onInputChange} />
      </>
    );
  }

}


export default App;
