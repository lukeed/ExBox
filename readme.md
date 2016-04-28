# ExBox

> A resusable, pre-packaged Vagrant box for easy Elixir development.

**WIP** - not ready for use yet

## Install

```
npm install -g exbox
```

## Usage

```
$ exbox 

  Usage
    $ exbox [command] [options]
  
  Commands
    init        Setup ExBox for the first time
    database    Create a new Database on the VM
    domain      Map a Domain to a VM directory
    folder      Map a Local directory to the VM
    *           Run `vagrant -h` for additional commands

  Examples
    $ exbox setup
    $ exbox folder ~/code/project /home/vagrant/code/project
    $ exbox domain phoenix.dev /home/vagrant/code/project
    $ exbox domain --ssl phoenix.dev /home/vagrant/code/project
    $ exbox database phoenix_db --mysql'
    $ exbox reload
    $ exbox ssh
```

## License

MIT © [Luke Edwards](https://lukeed.com)
