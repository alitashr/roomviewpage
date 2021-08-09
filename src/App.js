import './App.scss';
import metadata from "./metadata.json";
import RoomViewPage from './components/pages/RoomViewPage';

function App() {
  return (
    <div className="App">
      <RoomViewPage></RoomViewPage>
      {/* <div>{`Version ${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision} ${metadata.buildTag}` }</div> */}

    </div>
  );
}

export default App;
