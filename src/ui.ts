import * as Constants from './constants.ts';

type CLASS_TYPE = 'mode' | 'feature' | 'mouse';
const classTypes: CLASS_TYPE[] = ['mode', 'feature', 'mouse'];


const controls: Record<string, boolean> = {
	line_string: true,
	point :true,
	polygon: true,
	trash: true,
} 
export default function (ctx: { container: HTMLElement; options: { controls: typeof controls; keybindings: boolean }; events: {changeMode: (val: string)=>void; trash: ()=>void; combineFeatures:()=>void; uncombineFeatures:()=>void}}) {
	const buttonElements: Record<string, HTMLButtonElement> = {};
	let activeButton: HTMLButtonElement | null = null;

	let currentMapClasses = {
		mode: null, // e.g. mode-direct_select
		feature: null, // e.g. feature-vertex
		mouse: null, // e.g. mouse-move
	};

	let nextMapClasses = {
		mode: null,
		feature: null,
		mouse: null,
	};

	function clearMapClasses() {
		queueMapClasses({ mode: null, feature: null, mouse: null });
		updateMapClasses();
	}

	function queueMapClasses(options: {mode?: string | null; feature?: string | null; mouse?: string | null}) {
		nextMapClasses = Object.assign(nextMapClasses, options);
	}

	function updateMapClasses() {
		if (!ctx.container) return;

		const classesToRemove: string[] = [];
		const classesToAdd: string[] = [];

		classTypes.forEach((type) => {
			if (nextMapClasses[type] === currentMapClasses[type]) return;

			classesToRemove.push(`${type}-${currentMapClasses[type]}`);
			if (nextMapClasses[type] !== null) {
				classesToAdd.push(`${type}-${nextMapClasses[type]}`);
			}
		});

		if (classesToRemove.length > 0) {
			ctx.container.classList.remove(...classesToRemove);
		}

		if (classesToAdd.length > 0) {
			ctx.container.classList.add(...classesToAdd);
		}

		currentMapClasses = Object.assign(currentMapClasses, nextMapClasses);
	}

	function createControlButton(id: string, options: {className?: string; title: string; container: HTMLElement; onActivate: () => void; onDeactivate?: () => void}) {
		const button = document.createElement('button');
		button.className = `${Constants.classes.CONTROL_BUTTON} ${options.className}`;
		button.setAttribute('title', options.title);
		options.container.appendChild(button);

		button.addEventListener(
			'click',
			(e) => {
				e.preventDefault();
				e.stopPropagation();

				const clickedButton = e.target;
				if (clickedButton === activeButton) {
					deactivateButtons();
					if (options.onDeactivate){
						options.onDeactivate();
					}
					return;
				}

				setActiveButton(id);
				options.onActivate();
			},
			true,
		);

		return button;
	}

	function deactivateButtons() {
		if (!activeButton) return;
		activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
		activeButton = null;
	}

	function setActiveButton(id: string) {
		deactivateButtons();

		const button = buttonElements[id];
		if (!button) return;

		if (button && id !== 'trash') {
			button.classList.add(Constants.classes.ACTIVE_BUTTON);
			activeButton = button;
		}
	}

	function addButtons() {
		const controls = ctx.options.controls;
		const controlGroup = document.createElement('div');
		controlGroup.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;

		if (!controls) return controlGroup;

		if (controls[Constants.types.LINE]) {
			buttonElements[Constants.types.LINE] = createControlButton(
				Constants.types.LINE,
				{
					container: controlGroup,
					className: Constants.classes.CONTROL_BUTTON_LINE,
					title: `LineString tool ${ctx.options.keybindings ? '(l)' : ''}`,
					onActivate: () =>
						ctx.events.changeMode(Constants.modes.DRAW_LINE_STRING),
					onDeactivate: () => ctx.events.trash(),
				},
			);
		}

		if (controls[Constants.types.POLYGON]) {
			buttonElements[Constants.types.POLYGON] = createControlButton(
				Constants.types.POLYGON,
				{
					container: controlGroup,
					className: Constants.classes.CONTROL_BUTTON_POLYGON,
					title: `Polygon tool ${ctx.options.keybindings ? '(p)' : ''}`,
					onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POLYGON),
					onDeactivate: () => ctx.events.trash(),
				},
			);
		}

		if (controls[Constants.types.POINT]) {
			buttonElements[Constants.types.POINT] = createControlButton(
				Constants.types.POINT,
				{
					container: controlGroup,
					className: Constants.classes.CONTROL_BUTTON_POINT,
					title: `Marker tool ${ctx.options.keybindings ? '(m)' : ''}`,
					onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POINT),
					onDeactivate: () => ctx.events.trash(),
				},
			);
		}

		if (controls.trash) {
			buttonElements.trash = createControlButton('trash', {
				container: controlGroup,
				className: Constants.classes.CONTROL_BUTTON_TRASH,
				title: 'Delete',
				onActivate: () => {
					ctx.events.trash();
				},
			});
		}

		if (controls.combine_features) {
			buttonElements.combine_features = createControlButton('combineFeatures', {
				container: controlGroup,
				className: Constants.classes.CONTROL_BUTTON_COMBINE_FEATURES,
				title: 'Combine',
				onActivate: () => {
					ctx.events.combineFeatures();
				},
			});
		}

		if (controls.uncombine_features) {
			buttonElements.uncombine_features = createControlButton(
				'uncombineFeatures',
				{
					container: controlGroup,
					className: Constants.classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
					title: 'Uncombine',
					onActivate: () => {
						ctx.events.uncombineFeatures();
					},
				},
			);
		}

		return controlGroup;
	}

	function removeButtons() {
		Object.keys(buttonElements).forEach((buttonId) => {
			const button = buttonElements[buttonId];
			if (button.parentNode) {
				button.parentNode.removeChild(button);
			}
			delete buttonElements[buttonId];
		});
	}

	return {
		setActiveButton,
		queueMapClasses,
		updateMapClasses,
		clearMapClasses,
		addButtons,
		removeButtons,
	};
}
