<div class="prose-secondary prose max-w-none p-4">
	<h1 class="not-prose text-4xl font-semibold">
		<img src="/favicon.svg" alt="Logo" class="inline-block w-16" /> NotesVac
	</h1>
	<p>
		NotesVac is a tool to transcribe and store your handwritten notes in an easily searchable
		personal knowledge base. NotesVac is local first - all of your notes are saved in a private
		SQLite database on your computer<sup>*</sup>.
	</p>
	<h2 id="purpose">Purpose</h2>
	<p>
		The purpose of NotesVac is to provide a seamless way to digitize and organize handwritten notes.
		By leveraging modern technologies, NotesVac ensures that your notes are easily accessible,
		searchable, and securely stored on your local machine.
	</p>
	<h2 id="what-it-does">What It Does</h2>
	<p>
		NotesVac transcribes handwritten notes into digital text using advanced OCR (Optical Character
		Recognition) technology. Once transcribed, the notes are stored in a SQLite database, allowing
		for efficient searching and retrieval. The application provides a user-friendly interface to
		manage and categorize your notes, making it easy to find and reference them later.
	</p>
	<h2 id="how-it-achieves-it">How It Achieves It</h2>
	<ul>
		<li>
			<strong>OCR Technology</strong>: Utilises state-of-the-art OCR algorithms to accurately
			transcribe handwritten notes into digital text.
		</li>
		<li>
			<strong>Local Storage</strong>: Stores all notes in a local SQLite database, ensuring privacy
			and quick access without the need for an internet connection.
		</li>
		<li>
			<strong>User Interface</strong>: Features an intuitive and responsive user interface built
			with Svelte, allowing users to easily manage and search their notes.
		</li>
		<li>
			<strong>Search Functionality</strong>: Implements powerful search capabilities to quickly find
			notes based on keywords.
		</li>
	</ul>
	<h2 id="key-features">Key Features</h2>
	<ul>
		<li><strong>Advanced OCR</strong>: High accuracy in transcribing handwritten notes.</li>
		<li>
			<strong>Local-First Approach</strong>: Ensures data privacy and offline access by storing
			notes locally.<sup>*</sup>
		</li>
		<li><strong>Efficient Search</strong>: Quickly find notes with robust search functionality.</li>
		<li>
			<strong>User-Friendly Interface</strong>: Built with Svelte for a smooth and responsive user
			experience.
		</li>
		<li>
			<strong>Categorization and Tagging</strong>: Organize notes with categories and tags for easy
			retrieval.
		</li>
		<li>
			<strong>Secure Storage</strong>: Uses SQLite for secure and efficient local storage of notes.
		</li>
	</ul>

	<p>
		<a
			href="/note/new"
			type="button"
			class="not-prose rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
		>
			Get Started!
		</a>
	</p>
	<small
		><sup>*</sup>Data is sent to third party APIs for handwriting transcription and for other AI
		features.</small
	>
</div>
