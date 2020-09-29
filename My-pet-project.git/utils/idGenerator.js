export default function (document) {
    return { ...document.data(), idFromFirebase: document.id } //връща js обект, а не Сами + закачаме id на user. това id го закачаме на контекста, взимайки го от респонса на dataBase.docs.map(d.data()). СЪЩОТО id го подаваме в темплейта на cause -> dashboard        
}