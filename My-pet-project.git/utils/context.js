export default function extend(context) {

    return context.loadPartials({
        header: '../views/common/header.hbs',
        footer: '../views/common/footer.hbs'
    });
}