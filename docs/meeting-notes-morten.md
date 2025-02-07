# Meeting notes with Morten designer

## Ideas

### Highlight the path in CimDig

When we traverse the CIM model then it can be confusing to see which path the user is focusing on.
We should add some visual indication of the path that the user is currently traversing.
This could be to make the text bolder, or use something else.

### Show type when zoom out

Write out the name of the CIM component when the users zooms out.

### Idea fra Lars Erik

Perhaps the nodes can be placed closer to each other if the user zooms out.
Then the user can see more of the CIM model graph tree.

### Write "other references" in the list view 

Each component have a button that shows a list of other related components.
Write "other references" here since that makes more sense.
They are not properties that the UI says it is.

### Use hamburger menu icon for "other references" button

This is perhaps a better icon.

### Copy properties

Should we enable the user to copy all properties for a component?
Should we add a method for copying only the MRID?

Should the copy button be placed in the yellow popup?
Morten thinks that we should put it inside the popup rather than outside.

__Misunderstanding with copy icon__ <br>
If the copy button is placed outside of the component then how will the user interpret that?
Will they interpret that all properties are copied or that the whole React flow component is copied?

### Rethink our expand button

Our expand button is the button that expands the nodes. 
This can be replaced with the `<Handler>` that exists in React flow:
https://reactflow.dev/api-reference/components/handle


### Truncate text if it's too long?

Should we truncate the text (text...) if it's too long?
This can happen for long names.

### Idea for later, expand nodes from left and right

Now nodes expands only to the right side.
But we should later implement a solution where the nodes can expand to the left side as well.

### Add relevant fields for breakers, generators, power transformers etc.

Many component exists within a substation which includes:
- Breakers
- Power transformers
- Generators

All these components should list in their React Flow component the substation name.
This makes it easier for users to understand how they are related to each other.

### Use a custom edge to show if component is related to EquipmentContainer

It can be hard for users to understand if a component is related to a EquipmentContainer or not.
We can add some visual indication to show that.

## Problems

### Colours can be a problem

We have added colours in Ivo's branch in `fargeendring_for_nye_komponenter` to visualize the differen paths that the user is traversing .
However, users can be confused by the colours by adding extra meaning to it.
An example is we use the colour red. Certain user can interpret that an errror has occurred.

In addition, if the graph expands to four paths where two of the paths have the same colour then that can be confusing as well.
Users can try to relate the paths together despite them not being related.

Moreover, what problem are we trying to solve? We want to solve the problem where the user gets lost with many different paths.
However, will this problem occur? Perhaps troubleshooting the CIM model doesn't require traversing that many paths.



