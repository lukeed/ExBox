# ExBox

> A resusable, pre-packaged Vagrant box for easy Elixir development.

**WIP** - not ready for use yet

## Setup

Before launching your ExBox environment, you must install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://www.vagrantup.com/downloads.html). Both of these software packages provide easy-to-use visual installers for all popular operating systems.

You must also have [Node.js](https://nodejs.org/en/download/) installed in order to download and use ExBox. Node version `0.10` and above is supported!

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
