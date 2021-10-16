// autobind decorator
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        /* 
            the ! means the item will always be available 
            We are sure the element exists
            <template id="project-input">
            add type casting to tell TS that the element we are
            finding is an <HTMLTemplateElement>
        */
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // Set the template content to the div app element
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        // Get form element
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private clearForm() {
        this.element.reset();
    }

    private gatherUserInfo(): [string, string, number] | void {
        const inputTitle = this.titleInputElement.value.trim();
        const inputDescription = this.descriptionInputElement.value.trim();
        const inputPeople = this.peopleInputElement.value.trim();

        if (!inputTitle.length || !inputDescription.length || !inputPeople.length) {
            alert('All fields are required!');
            return;
        }
        else return [inputTitle, inputDescription, +inputPeople]
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInfo = this.gatherUserInfo();

        if (Array.isArray(userInfo)) {
            const [title, description, people] = userInfo;
            console.log(title, description, people);
            this.clearForm();
        }
    }

    // Add an event listener to the form
    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }

}

// initialize element
const pjtInput = new ProjectInput();