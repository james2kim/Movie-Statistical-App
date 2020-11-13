const autoCompleteConfig={
    renderOption(movie){
        const imgSrc=movie.Poster==='N/A'? '' : movie.Poster;
        return `
        <img src="${movie.Poster}"/>
        ${movie.Title} (${movie.Year})
        `;
    },

    inputValue(movie) {
        return movie.Title
    },
    async fetchData(searchTerm) {
        const response=await axios.get('https://www.omdbapi.com/',{
            params:{
                apikey: '58196d3c',
                s:searchTerm
                
            }
        });
        
        if(response.data.Error){
            return [];
        }
        
        return response.data.Search
        }
}

createAutoComplete({
    ...autoCompleteConfig,
    root:document.querySelector('#left-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie,document.querySelector('#left-summary'),'left');
    }
})

createAutoComplete({
    ...autoCompleteConfig,
    root:document.querySelector('#right-autocomplete'),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie,document.querySelector('#right-summary'),'right');
    }
})

let leftMovie;
let rightMovie;
let leftRec = 0
let rightRec = 0
let showModal = false 
const recommendation = document.querySelector('#movie-rec')
const backdrop = document.querySelector('#Backdrop')
const closeIcon = document.querySelector('#close-icon')
const modal = document.querySelector('#Modal')
recommendation.addEventListener('click', () => {
    modal.classList.remove('HideModal')
    modal.classList.add('ShowModal')
    backdrop.classList.remove('hide-display')   
    const movie = runComparison()
    const stat = leftRec > rightRec ? leftRec : rightRec
    const leftSideRating = parseFloat(document.querySelector('#left-summary .rating').dataset.value)
    const rightSideRating = parseFloat(document.querySelector('#right-summary .rating').dataset.value)
    let losingIndex = 0
    let winningIndex = 0

    if (leftSideRating > rightSideRating) {
        winningIndex = 1
        losingIndex = 0
    } else {
        winningIndex = 0
        losingIndex = 1
    }
    let rec
    leftRec === rightRec ? rec =  `<div id="stat-rec">
    <p style="padding-top:5%">Based On The Analysis, 
    the Movie Statistical recommends 
    <span class="bold">${movie[winningIndex]}</span> over 
    <span class="italic">${movie[losingIndex]}.</span> </p>
    <br>
    <p style="padding-bottom:5%">The Movie Statistical takes the weight of IMBD Rating, Metascore, Number of Awards, Box Office Amount, and IMDB Votes 
    and evenly distributes it to give you our recommendation. In this particular case, the two movies squared off evenly, showing statistical advantages in seperate metrics. In the event of a tie, the Movie Statistical gives the final recommendation to the Movie with the higher IMBD Rating. </p>
    </div>` : 
    rec = `<div id="stat-rec">
    <p style="padding-top:5%">Based On The Analysis, 
    the Movie Statistical recommends 
    <span class="bold">${movie[0]}</span> over 
    <span class="italic">${movie[1]}.</span> </p>
    <br>
    <p style="padding-bottom:5%">The Movie Statistical takes the weight of IMBD Rating, Metascore, Number of Awards, Box Office Amount, and IMDB Votes 
    and evenly distributes it to give you our recommendation. ${movie[0]} scored higher than ${movie[1]} on ${(stat / 5) * 100}% of the movie criterias and is ultimately our recommendation of the two.</p>
    </div>`



    modal.insertAdjacentHTML('beforeend', rec)
})

const closeModalHandler = () => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification')
    const rightSideStats = document.querySelectorAll('#right-summary .notification')
    leftSideStats.forEach((leftStat, index) => {
        const rightStat=rightSideStats[index]
        const leftSideValue=parseFloat(leftStat.dataset.value)
        const rightSideValue=parseFloat(rightStat.dataset.value)
        if(rightSideValue>leftSideValue) {
            leftStat.classList.remove('is-warning')
            leftStat.classList.add('grey-light')
            rightStat.classList.remove('is-primary')
            rightStat.classList.add('grey-light')
        } else if (rightSideValue < leftSideValue){
            rightStat.classList.remove('is-warning')
            rightStat.classList.add('grey-light')
            leftStat.classList.remove('is-primary')
            leftStat.classList.add('grey-light')
        } 

    })
    modal.classList.remove('ShowModal')
    modal.classList.add('HideModal')
    backdrop.classList.add('hide-display')   
    document.querySelector('#stat-rec').remove()
    leftRec = 0
    rightRec = 0
}


backdrop.addEventListener('click', closeModalHandler)
closeIcon.addEventListener('click', closeModalHandler)


const onMovieSelect=async (movie,summaryElement,side)=>{
    const response=await axios.get('http://www.omdbapi.com/',{
    params:{
        apikey: '58196d3c',
        i:movie.imdbID
    }
})
console.log(response.data)
summaryElement.innerHTML=movieTemplate(response.data)

if(side==='left'){
    leftMovie=response.data
} else{
    rightMovie=response.data
}

if(leftMovie&&rightMovie){
    // runComparison()
    recommendation.classList.remove('hide-display')
}   
}

const runComparison=()=>{
    const leftSideStats = document.querySelectorAll('#left-summary .notification')
    const rightSideStats = document.querySelectorAll('#right-summary .notification')
    leftSideStats.forEach((leftStat,index) => {
        const rightStat=rightSideStats[index]
        const leftSideValue=parseFloat(leftStat.dataset.value)
        const rightSideValue=parseFloat(rightStat.dataset.value)
        
        console.log(leftSideValue, rightSideValue)
        
        if(rightSideValue>leftSideValue) {
            leftStat.classList.remove('grey-light')
            leftStat.classList.add('is-warning')
            rightStat.classList.remove('grey-light')
            rightStat.classList.add('is-primary')
            rightRec ++
        } else if (rightSideValue < leftSideValue){
            rightStat.classList.remove('grey-light')
            rightStat.classList.add('is-warning')
            leftStat.classList.remove('grey-light')
            leftStat.classList.add('is-primary')
            leftRec++
        } 
    })
    console.log(leftRec, rightRec)
    const leftSideMovie = document.querySelector('#left-summary .content').dataset.value
    const rightSideMovie = document.querySelector('#right-summary .content').dataset.value
    console.log(leftSideMovie, rightSideMovie)
    if (leftRec > rightRec) {
       return [leftSideMovie, rightSideMovie]
    } else {
        return  [rightSideMovie, leftSideMovie]
    }

}

const movieTemplate= movieDetail => {
   const dollars=parseInt(movieDetail.BoxOffice.replace(/\$/g,'').replace(/,/g,''))
   const metascore=parseInt(movieDetail.Metascore)
   const imdbRating=parseFloat(movieDetail.imdbRating)
   const imdbVotes=parseInt(movieDetail.imdbVotes.replace(/,/g,''))
   
   const awards=movieDetail.Awards.split(' ').reduce((prev,word)=>{
       const value=parseInt(word)

       if(isNaN(value)){
           return prev;
       } else{
           return prev+value;
       }
   },0)
   console.log(awards)

return `
<article class="media">
    <figure class="media-left">
        <p class="image">
            <img src="${movieDetail.Poster}" />
        </p>
    </figure>
    <div class="media-content">
        <div class="content"  data-value="${movieDetail.Title}">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
        </div>
    </div>
</article>
<article data-value=${imdbRating} class="rating notification grey-light">
    <p class="title">${movieDetail.imdbRating}</p>
    <p class="subtitle">IMDB Rating</p>
</article>
<article data-value=${metascore} class="notification grey-light">
    <p class="title">${movieDetail.Metascore}</p>
    <p class="subtitle">Metascore</p>
</article>
<article data-value=${awards} class="notification grey-light">
    <p class="title">${movieDetail.Awards==='N/A'? '---' : movieDetail.Awards} </p>
    <p class="subtitle">Awards</p>
</article>
<article  data-value=${dollars} class="notification grey-light">
    <p class="title">${movieDetail.BoxOffice==='N/A'? '---' : movieDetail.BoxOffice}</p>
    <p class="subtitle">Box Office</p>
</article>
<article data-value=${imdbVotes} class="notification grey-light">
    <p class="title">${movieDetail.imdbVotes}</p>
    <p class="subtitle">IMDB Votes</p>
</article>

`;

}